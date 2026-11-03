// priority: -8600
// -----------------------------------------------------------------------------------------------
// UHV's Proxima life (docs/eras/uhv.md, machines 12, 26, 27, 28 and 30, lines 13, 14, 15 and 32; package UHV-B4): the xenoflora rover
// bay, the xenobotany greenhouse, the xenobiochemistry plant and the radiotrophic vat on Proxima b, and the sample receiving facility on
// Earth, their recipe types, items and materials. The recipes come from data/grindless/tables/proxima_life.json
// (server_scripts/grindless/uhv/proxima_life.js); the older rows from biofoundry.json (LuV's biofoundry, circuits 11-16: the far-red
// cassette, the engineered algae and four cultures) and luv/europa.js (the algae bioreactor's far-red row, Proxima b only).
//
//   gtceu:xenoflora_rover_bay        a hangar: rovers on a curium heat source and betavoltaics (no sun on the night side) bring back
//                                    flora samples and a regolith survey. Proxima b only. Type gtceu:xenoflora_rover.
//   gtceu:sample_receiving_facility  NASA and ESA's Mars Sample Return facility, a BSL-4 hall with an airlock train: the only way a
//                                    Proxima sample becomes something Earth uses. Earth only. Type gtceu:sample_receiving.
//   gtceu:xenobotany_greenhouse      the greenhouse family's step 8: far-red photosynthesis at the terminator, sealed (no breathable
//                                    air: S0-9). Proxima b only. Type gtceu:xenobotany.
//   gtceu:xenobiochem_plant          radioprotectant, infrared pigment and chitosan where the life grows. Proxima b only. Type
//                                    gtceu:xenobiochemistry.
//   gtceu:radiotrophic_vat           Cladosporium grown under the flares into melanised biomass (line 15's shielding). Proxima b only.
//                                    Type gtceu:radiotrophic.
//
// New ids (the F1 ones are in uhv/foundation.js and are not registered again):
//   items     proxima_rover, xeno_biomass, xeno_mushroom, xeno_chitin, xeno_chitosan, melanised_biomass, sterilised_flora_extract, sterilised_ice_organics,
//             melanin_extract, melanin_chitosan_composite, flare_shield_panel, far_red_gene_cassette, engineered_far_red_algae,
//             cladosporium_culture, chromobacterium_culture, sphingomonas_culture, sporosarcina_culture
//   materials far_red_pigment, clarified_xeno_lysate (liquids)
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): the facility is 9 x 5 x 9 (two laminated-glass airlock walls
// with a door, a heatproof autoclave-incinerator at the back), the rover bay 7 x 5 x 7 (a computer-casing console), the greenhouse
// 9 x 6 x 9 (a soil bed, glass walls from row 2, GT lamps), the plant 11 x 7 x 11 (four PTFE lysis tanks round a clean reactor), the vat
// 11 x 7 x 9 (a tungstensteel core in a clean paddle ring and a laminated-glass flare window in the front wall; BSL-4 body, because the
// Proxima base casing is made from line 15's flare shield panel, the vat's own product).
// Textures: tools/assets/Build-UHVProximaLifeTextures.ps1. Names: client_scripts/grindless/uhv_proxima_life_lang.js.
// Published: global.grindless.proximaLife (.machines, .ids, .table; the cultures for UHV-B5's biomining heap).
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const PL = G.proximaLife || (G.proximaLife = {})
  const LOG = '[grindless/uhv] '

  const BSL4 = 'grindless:bsl4_casing'
  const BSL4_TEXTURE = 'grindless:block/uhv/bsl4_casing'
  const HANGAR = 'grindless:hangar_casing'
  const HANGAR_TEXTURE = 'grindless:block/uhv/hangar_casing'
  const GLASS = 'gtceu:laminated_glass'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const TUNGSTEN_PIPE = 'gtceu:tungstensteel_pipe_casing'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const CLEAN = 'gtceu:clean_machine_casing'
  const COMPUTER = 'gtceu:computer_casing'
  const SOIL = ['minecraft:dirt', 'minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:podzol', 'minecraft:rooted_dirt',
    'minecraft:farmland', 'minecraft:moss_block', 'minecraft:mud']
  const LAMPS = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue',
    'brown', 'green', 'red', 'black'].reduce(function (a, c) { return a.concat(['gtceu:' + c + '_lamp', 'gtceu:' + c + '_borderless_lamp']) }, [])

  PL.table = 'kubejs/data/grindless/tables/proxima_life.json'
  PL.items = {
    proxima_rover: { stack: 16 },
    xeno_biomass: { stack: 64 },
    xeno_mushroom: { stack: 64 },
    xeno_chitin: { stack: 64 },
    xeno_chitosan: { stack: 64 },
    melanised_biomass: { stack: 64 },
    sterilised_flora_extract: { stack: 64 },
    sterilised_ice_organics: { stack: 64 },
    melanin_extract: { stack: 64 },
    melanin_chitosan_composite: { stack: 64 },
    flare_shield_panel: { stack: 64 },
    far_red_gene_cassette: { stack: 64 },
    engineered_far_red_algae: { stack: 64 },
    cladosporium_culture: { stack: 64 },
    chromobacterium_culture: { stack: 64 },
    sphingomonas_culture: { stack: 64 },
    sporosarcina_culture: { stack: 64 }
  }
  PL.materials = {
    far_red_pigment: { colour: 0x6A0E22, formula: 'C55H70MgN4O6' },
    clarified_xeno_lysate: { colour: 0xC89A6A, formula: '(xeno lysate)' }
  }
  PL.ids = {
    rover: 'grindless:proxima_rover',
    xenoBiomass: 'grindless:xeno_biomass',
    xenoMushroom: 'grindless:xeno_mushroom',
    xenoChitin: 'grindless:xeno_chitin',
    xenoChitosan: 'grindless:xeno_chitosan',
    melanisedBiomass: 'grindless:melanised_biomass',
    floraExtract: 'grindless:sterilised_flora_extract',
    iceOrganics: 'grindless:sterilised_ice_organics',
    melaninExtract: 'grindless:melanin_extract',
    composite: 'grindless:melanin_chitosan_composite',
    flareShieldPanel: 'grindless:flare_shield_panel',
    farRedCassette: 'grindless:far_red_gene_cassette',
    farRedAlgae: 'grindless:engineered_far_red_algae',
    cladosporium: 'grindless:cladosporium_culture',
    chromobacterium: 'grindless:chromobacterium_culture',
    sphingomonas: 'grindless:sphingomonas_culture',
    sporosarcina: 'grindless:sporosarcina_culture',
    farRedPigment: 'gtceu:far_red_pigment',
    lysate: 'gtceu:clarified_xeno_lysate'
  }

  PL.machines = {
    rover: {
      name: 'xenoflora_rover_bay',
      machine: 'gtceu:xenoflora_rover_bay',
      type: 'xenoflora_rover',
      dataKey: 'grindless_xenoflora_rover',
      lang: 'Xenoflora Rover Bay',
      casing: HANGAR,
      texture: HANGAR_TEXTURE,
      // items in: the rover, the approach data and the circuit; out: the samples, the survey and the parts back
      maxIO: { itemsIn: 3, itemsOut: 3, fluidsIn: 0, fluidsOut: 0 },
      width: 7, depth: 7, height: 5
    },
    facility: {
      name: 'sample_receiving_facility',
      machine: 'gtceu:sample_receiving_facility',
      type: 'sample_receiving',
      dataKey: 'grindless_sample_receiving',
      lang: 'Sample Receiving Facility',
      casing: BSL4,
      texture: BSL4_TEXTURE,
      // items in: the sample and the circuit; out: the extract and the genome data; fluid in: the peroxide vapour
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 },
      width: 9, depth: 9, height: 5
    },
    greenhouse: {
      name: 'xenobotany_greenhouse',
      machine: 'gtceu:xenobotany_greenhouse',
      type: 'xenobotany',
      dataKey: 'grindless_xenobotany',
      lang: 'Xenobotany Greenhouse',
      casing: BSL4,
      texture: BSL4_TEXTURE,
      // items in: the strain or the biomass and the circuit; fluids in: water and CO2; out: the crop, oxygen or pigment and residue
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 2, fluidsOut: 2 },
      width: 9, depth: 9, height: 6
    },
    plant: {
      name: 'xenobiochem_plant',
      machine: 'gtceu:xenobiochem_plant',
      type: 'xenobiochemistry',
      dataKey: 'grindless_xenobiochemistry',
      lang: 'Xenobiochemistry Plant',
      casing: BSL4,
      texture: BSL4_TEXTURE,
      // items in: the mushrooms, the caustic and the circuit; fluids: the lysate or pigment and its reagent in, the residue out
      maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 2, fluidsOut: 2 },
      width: 11, depth: 11, height: 7
    },
    vat: {
      name: 'radiotrophic_vat',
      machine: 'gtceu:radiotrophic_vat',
      type: 'radiotrophic',
      dataKey: 'grindless_radiotrophic',
      lang: 'Radiotrophic Vat',
      casing: BSL4,
      texture: BSL4_TEXTURE,
      // items in: the culture, the biomass and the circuit; fluid in: water; out: the melanised biomass and the spent medium
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 },
      width: 11, depth: 9, height: 7
    }
  }

  // A hollow shell: row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller (front wall, row 1, middle).
  function shell(m, inner, wall) {
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
          else if (r === m.height - 1) ch = (si === mid || c === mid) ? 'P' : (isWall ? 'Z' : 'F')
          else if (si === last && r === 1 && c === mid) ch = 'S'
          else if (isWall) ch = (wall && wall(r, si, c)) || ((si === 0 || si === last) && (c === 0 || c === m.width - 1) ? 'Z' : (r === 2 && m.height > 5 ? 'F' : (r === 2 || (r === 3 && m.height > 5) ? 'L' : 'F')))
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // the airlock train: two laminated-glass walls (L) at slices 3 and 5 with a door gap in the middle; the autoclave-incinerator (H)
  // in the back corner of the BSL-4 room
  function facilityInner(r, si, c) {
    if (si === 3 || si === 5) return c === 4 && r <= 2 ? '#' : 'L'
    if (si <= 2 && c <= 2 && r <= 2) return 'H'
    return '#'
  }

  // the hangar's console (K) against the back wall; the rest is the rover pad
  function roverInner(r, si, c) {
    return si === 1 && r === 1 && c >= 2 && c <= 4 ? 'K' : '#'
  }

  // the soil bed (D) on row 1, four GT lamps (M) under the roof; the walls are glass (L) from row 2 up, the corners casing
  function greenhouseInner(r, si, c) {
    if (r === 1) return 'D'
    if (r === 4 && (c === 2 || c === 6) && (si === 2 || si === 6)) return 'M'
    return '#'
  }

  function greenhouseWall(r, si, c) {
    var corner = (si === 0 || si === 8) && (c === 0 || c === 8)
    return r >= 2 && !corner ? 'L' : null
  }

  // four lysis tanks (PTFE columns, P) round a clean-casing reactor (C) on the hall's axis: a 3x3 plinth with a 1x1 stack
  function plantInner(r, si, c) {
    var dc = Math.abs(c - 5)
    var ds = Math.abs(si - 5)
    if (dc === 3 && ds === 3) return 'P'
    if (dc <= 1 && ds <= 1) return r <= 2 || (dc === 0 && ds === 0) ? 'C' : '#'
    return '#'
  }

  // the tungstensteel core (T) of the vat in a clean-casing paddle ring (C); the flare window (L) spans the front wall
  function vatInner(r, si, c) {
    if (c === 5 && si === 4) return 'T'
    if (r === 1 && Math.abs(c - 5) <= 1 && Math.abs(si - 4) <= 1) return 'C'
    return '#'
  }

  function vatWall(r, si, c) {
    return si === 8 && r >= 3 && r <= 4 && c >= 2 && c <= 8 ? 'L' : null
  }

  function specOf(m, inner, wall, parts) {
    return {
      slices: shell(m, inner, wall),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(m.casing)].concat(parts)),
        F: Pat.block(m.casing),
        L: Pat.block(GLASS),
        Z: Pat.frame(['stainless_steel']),
        H: Pat.block(HEAT),
        K: Pat.block(COMPUTER),
        D: Pat.block(SOIL),
        M: Pat.block(LAMPS),
        P: Pat.block(PIPE),
        C: Pat.block(CLEAN),
        T: Pat.block(TUNGSTEN_PIPE),
        '#': Pat.air()
      }
    }
  }
  var M = PL.machines
  M.rover.spec = specOf(M.rover, roverInner, null, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('output_bus', { min: 1, max: 2 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])
  M.facility.spec = specOf(M.facility, facilityInner, null, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 1 }),
    Pat.part('output_bus', { min: 1, max: 2 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])
  M.greenhouse.spec = specOf(M.greenhouse, greenhouseInner, greenhouseWall, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 2 }),
    Pat.part('output_bus', { min: 1, max: 1 }),
    Pat.part('output_hatch', { min: 1, max: 2 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])
  M.plant.spec = specOf(M.plant, plantInner, null, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 2 }),
    Pat.part('output_bus', { min: 1, max: 2 }),
    Pat.part('output_hatch', { min: 1, max: 2 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])
  M.vat.spec = specOf(M.vat, vatInner, vatWall, [
    Pat.part('input_bus', { min: 1, max: 1 }),
    Pat.part('input_hatch', { min: 1, max: 1 }),
    Pat.part('output_bus', { min: 1, max: 1 }),
    Pat.part('output_hatch', { min: 1, max: 1 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])
  PL.order = ['rover', 'facility', 'greenhouse', 'plant', 'vat']

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

  // ---------------------------------------------------------------- materials

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(PL.materials).forEach(function (name) {
      var spec = PL.materials[name]
      event.create(name).liquid().color(spec.colour).formula(spec.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    Object.keys(PL.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(PL.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    PL.order.forEach(function (k) {
      var m = PL.machines[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
        .setSound(k === 'rover' ? GTSoundEntries.ARC : GTSoundEntries.CHEMICAL)
    })
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    PL.order.forEach(function (k) {
      var m = PL.machines[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
