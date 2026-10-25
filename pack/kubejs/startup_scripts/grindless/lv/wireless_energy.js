// -----------------------------------------------------------------------------------------------
// LV: the wireless energy network (DECISIONS.md 2026-10-25, "Wireless energy"; docs/eras/lv.md, "Wireless energy"). One network for
// the whole server: every dimension puts EU in and takes EU out of the same store, with 5% lost on the way in. Registrations only;
// the network itself (the store, the settlement, the readout, the covers' placing) and the recipes are in
// server_scripts/grindless/lv/wireless_energy.js. The numbers are in kubejs/data/grindless/tables/wireless_energy.json.
//
//   gtceu:wireless_energy_tower                 the store: a multiblock of ours (LV, lib/patterns.js), 3 x 3 x 8. Its 32 cell slots take
//                                               capacitor cells of any tier (or its casing, an empty slot); a formed tower adds the
//                                               capacity of its cells to the network, and several towers add up. The network's tier
//                                               is the lowest tier among the cells of every formed tower (the idea of GTM 7.5.3's Power
//                                               Substation, cells read from the formed structure, and of GTNH's Lapotronic
//                                               Supercapacitor, both LGPL-3.0; nothing copied). No machine part: energy comes in and
//                                               goes out wirelessly. GTM's dummy recipe type, like GTM's own substation.
//   grindless:<tier>_capacitor_cell             the cells, LV to IV (capacity: six of the tier's reference batteries, the table)
//   gtceu:<tier>_wireless_energy_hatch[_4a|_16a|_64a]   a multiblock energy hatch (PartAbility.INPUT_ENERGY) the network fills
//   gtceu:<tier>_wireless_dynamo_hatch[_4a|_16a|_64a]   a multiblock dynamo hatch (PartAbility.OUTPUT_ENERGY) the network empties
//                                               Both are GTM's own EnergyHatchPartMachine (no new Java class), built with GTM's KubeJS
//                                               'custom' machine type, at 2, 4, 16 and 64 A for LV to IV: GTM's own buffers (an energy
//                                               hatch holds 16 ticks of its full rate, a dynamo hatch 64), GTM's voltage rules, rain
//                                               check, scanner and Jade. The 64 A ones carry OUTPUT_ENERGY / INPUT_ENERGY (not GTM's
//                                               substation abilities), so a 64 A dynamo hatch goes in any generator multiblock.
//   grindless:wireless_energy_cover.<tier>      a cover for single-block machines: the network feeds the machine it is on
//   grindless:wireless_dynamo_cover.<tier>      a cover that sends a generator's or battery buffer's stored EU into the network
//                                               GTM 7.5.3 has no KubeJS cover builder, so the definitions go through GTM's own addon
//                                               path: GTCovers.init() posts GTCEuAPI.RegisterEvent<ResourceLocation, CoverDefinition>
//                                               on every mod bus before it freezes GTRegistries.COVERS, after the startup scripts have
//                                               loaded (CommonProxy runs init() as enqueued work of FMLConstructModEvent). This script
//                                               listens with ForgeModEvents.onGenericEvent. The behaviour is GTM's WirelessTransmitterCover
//                                               (no UI, no ticking, no capability change: a marker) with our own SimpleCoverRenderer
//                                               texture; the server script places them (BlockEvents.rightClicked ->
//                                               ICoverable#placeCoverOnSide) and moves the energy. GTM drops the item when a crowbar
//                                               takes the cover off (CoverBehavior#getPickItem is the item it was placed from).
//   grindless:<tier>_wireless_energy_cover / _wireless_dynamo_cover   the cover items
//
// Published as global.grindless.wireless for the server script, the lang script and the smoke test (ids, kinds, tiers, the table).
// Textures and models: tools/assets/Build-WirelessEnergyTextures.ps1; names: client_scripts/grindless/wireless_energy_lang.js.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  const G = global.grindless || (global.grindless = {})
  const W = G.wireless || (G.wireless = {})
  if (typeof G.readJsonTable !== 'function') {
    throw new Error('[grindless/wireless] lib/tables.js has to load first (it has priority 900)')
  }
  const Pat = G.patterns
  const T = G.readJsonTable('kubejs/data/grindless/tables/wireless_energy.json')
  if (!T || !T.tiers || T.tiers.length !== 5 || !T.hatchAmps || !T.tower) throw new Error('[grindless/wireless] wireless_energy.json is incomplete')
  const LOG = '[grindless/wireless] '

  const TIER_NAMES = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv']
  W.table = T
  W.tierNames = TIER_NAMES
  W.tiers = T.tiers.map(function (r) { return r.tier })
  W.tierRow = {}
  T.tiers.forEach(function (r) { W.tierRow[r.tier] = r })
  W.settleTicks = T.settleTicks
  W.lossNumerator = T.loss.numerator
  W.lossDenominator = T.loss.denominator
  W.hatchAmps = T.hatchAmps.slice()
  W.coverAmps = T.coverAmps
  W.towerId = T.tower.id
  W.casing = T.tower.casing
  // V x A: what one block carries per tick at full rate
  W.rate = function (tier, amps) { return Number(GTValues.V[tier]) * amps }

  // the cells: block id -> { tier, capacity }
  W.cells = {}
  W.cellIds = []
  T.tiers.forEach(function (r) {
    W.cells[r.cell] = { tier: r.tier, capacity: r.capacity }
    W.cellIds.push(r.cell)
  })

  // the hatches: role 'deposit' = the settlement empties it into the network, 'withdraw' = it fills it from the network
  W.hatchKinds = {
    hatch: { key: 'hatch', base: 'wireless_energy_hatch', io: 'IN', role: 'withdraw', ability: 'INPUT_ENERGY', label: 'Wireless Energy Hatch' },
    dynamo: { key: 'dynamo', base: 'wireless_dynamo_hatch', io: 'OUT', role: 'deposit', ability: 'OUTPUT_ENERGY', label: 'Wireless Dynamo Hatch' }
  }
  W.hatchKindList = ['hatch', 'dynamo']
  W.hatchName = function (kind, amps) { return W.hatchKinds[kind].base + (amps === 2 ? '' : '_' + amps + 'a') }
  W.hatchId = function (kind, tier, amps) { return 'gtceu:' + TIER_NAMES[tier] + '_' + W.hatchName(kind, amps) }
  W.hatches = {}
  W.hatchIds = []
  W.hatchKindList.forEach(function (kind) {
    W.hatchAmps.forEach(function (amps) {
      W.tiers.forEach(function (tier) {
        var id = W.hatchId(kind, tier, amps)
        W.hatches[id] = { kind: kind, tier: tier, amps: amps }
        W.hatchIds.push(id)
      })
    })
  })

  // the covers: definition id -> { kind, tier, item }, item id -> the same
  W.coverKinds = {
    energy: { key: 'energy', base: 'wireless_energy_cover', role: 'withdraw', label: 'Wireless Energy Cover' },
    dynamo: { key: 'dynamo', base: 'wireless_dynamo_cover', role: 'deposit', label: 'Wireless Dynamo Cover' }
  }
  W.coverKindList = ['energy', 'dynamo']
  W.coverDefId = function (kind, tier) { return 'grindless:' + W.coverKinds[kind].base + '.' + TIER_NAMES[tier] }
  W.coverItemId = function (kind, tier) { return 'grindless:' + TIER_NAMES[tier] + '_' + W.coverKinds[kind].base }
  W.covers = {}
  W.coverItems = {}
  W.coverList = []
  W.coverKindList.forEach(function (kind) {
    W.tiers.forEach(function (tier) {
      var c = { kind: kind, tier: tier, def: W.coverDefId(kind, tier), item: W.coverItemId(kind, tier) }
      W.covers[c.def] = c
      W.coverItems[c.item] = c
      W.coverList.push(c)
    })
  })
  // filled by GTM's cover registration below: definition id -> GTM's CoverDefinition
  W.coverDefinitions = W.coverDefinitions || {}
  W.coverMarker = 'com.gregtechceu.gtceu.common.cover.WirelessTransmitterCover'

  // ---------------------------------------------------------------- the cells

  StartupEvents.registry('block', function (event) {
    var FU = Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil')
    T.tiers.forEach(function (r) {
      event.create(r.cell)
        .soundType(SoundType.METAL)
        .hardness(4)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll('grindless:block/wireless/capacitor_cell_' + r.name)
        .item(function (item) {
          item.tooltip(Text.gray(Text.translate('tooltip.grindless.capacitor_cell.0', String(FU.formatNumbers(r.capacity)))))
          item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.capacitor_cell.1')))
        })
    })
  })

  // ---------------------------------------------------------------- the cover items

  StartupEvents.registry('item', function (event) {
    W.coverList.forEach(function (c) {
      var name = TIER_NAMES[c.tier]
      event.create(c.item)
        .texture('grindless:item/wireless/' + c.kind + '_cover_' + name)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.wireless_' + c.kind + '_cover.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.wireless_cover.rate', name.toUpperCase(), String(W.rate(c.tier, W.coverAmps)), String(W.coverAmps))))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.wireless_cover.place')))
    })
  })

  // ---------------------------------------------------------------- the covers (GTM's own registry, through its addon event)

  function coverRenderer(c) {
    // only the client calls this (CoverDefinition's constructor, GTCEu.isClientSide()): the renderer classes are client-only
    return function () {
      var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
      var SCR = Java.loadClass('com.gregtechceu.gtceu.client.renderer.cover.SimpleCoverRenderer')
      var Suppliers = Java.loadClass('com.google.common.base.Suppliers')
      var name = TIER_NAMES[c.tier]
      return Suppliers.ofInstance(new SCR(new RL('grindless', 'block/cover/wireless_' + c.kind + '_cover_' + name),
        new RL('grindless', 'block/cover/wireless_' + c.kind + '_cover_emissive')))
    }
  }

  ForgeModEvents.onGenericEvent('com.gregtechceu.gtceu.api.GTCEuAPI$RegisterEvent', 'com.gregtechceu.gtceu.api.cover.CoverDefinition', function (event) {
    try {
      var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
      var CD = Java.loadClass('com.gregtechceu.gtceu.api.cover.CoverDefinition')
      var Marker = Java.loadClass(W.coverMarker)
      W.coverList.forEach(function (c) {
        var parts = c.def.split(':')
        var id = new RL(parts[0], parts[1])
        var def = new CD(id, function (definition, coverable, side) { return new Marker(definition, coverable, side) }, coverRenderer(c))
        event.register(id, def)
        W.coverDefinitions[c.def] = def
      })
      console.info(LOG + 'registered ' + W.coverList.length + ' covers in GTM\'s cover registry')
    } catch (e) {
      console.error(LOG + 'the covers could not be registered: ' + e)
    }
  })

  // ---------------------------------------------------------------- the hatches and the tower

  function hatchTooltips(kind, tier, amps) {
    var FU = Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil')
    var EHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    var k = W.hatchKinds[kind]
    var v = FU.formatNumbers(GTValues.V[tier])
    var buffer = k.io === 'IN' ? Number(GTValues.V[tier]) * 16 * amps : Number(EHPM.getHatchEnergyCapacity(tier, amps))
    var lines = []
    if (k.io === 'IN') {
      lines.push(Text.translate('gtceu.universal.tooltip.voltage_in', v, GTValues.VNF[tier]))
      lines.push(Text.translate('gtceu.universal.tooltip.amperage_in', String(amps)))
    } else {
      lines.push(Text.translate('gtceu.universal.tooltip.voltage_out', v, GTValues.VNF[tier]))
      lines.push(Text.translate('gtceu.universal.tooltip.amperage_out', String(amps)))
    }
    lines.push(Text.translate('gtceu.universal.tooltip.energy_storage_capacity', FU.formatNumbers(buffer)))
    lines.push(Text.translate('grindless.machine.' + k.base + '.tooltip.0'))
    lines.push(Text.translate('grindless.machine.wireless.tooltip.network'))
    lines.push(Text.translate('grindless.machine.wireless.tooltip.readout'))
    return lines
  }

  function modelOf(path) {
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    return new RL('grindless', path)
  }

  // the tower: slices back -> front, rows bottom -> top (lib/patterns.js). X the tower's casing, S the controller, C a cell slot (a
  // capacitor cell of any tier, or the casing: an empty slot), F the steel frame core and mast.
  const TOWER_SPEC = {
    slices: [
      ['XXX', 'CCC', 'CCC', 'CCC', 'CCC', 'XXX', '   ', '   '],
      ['XXX', 'CFC', 'CFC', 'CFC', 'CFC', 'XFX', ' F ', ' F '],
      ['XSX', 'CCC', 'CCC', 'CCC', 'CCC', 'XXX', '   ', '   ']
    ],
    symbols: {
      S: Pat.controller(),
      X: Pat.block(T.tower.casing),
      C: Pat.oneOf(Pat.block(W.cellIds), Pat.block(T.tower.casing)),
      F: Pat.frame([T.tower.frame])
    }
  }
  W.towerSpec = TOWER_SPEC

  // the controller's lines: this tower's cells, then the network (server side: the network lives in the server script)
  function towerDisplay(controller, list) {
    try {
      if (!controller.isFormed()) return
      var level = controller.getLevel()
      if (level === null || level === undefined || level.isClientSide()) return
      if (typeof W.towerInfo !== 'function' || typeof W.status !== 'function' || typeof W.perTick !== 'function') return
      var info = W.towerInfo(controller)
      var st = W.status(level.getServer())
      var FU = Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil')
      if (info.cells === 0) {
        list.add(Text.translate('grindless.machine.wireless_energy_tower.no_cells').red())
      } else {
        list.add(Text.translate('grindless.machine.wireless_energy_tower.cells', String(info.cells), TIER_NAMES[info.tier].toUpperCase(),
          String(FU.formatNumbers(info.capacity))))
      }
      if (st.up) {
        list.add(Text.translate('grindless.machine.wireless_energy_tower.network', String(FU.formatNumbers(st.stored)),
          String(FU.formatNumbers(st.capacity)), TIER_NAMES[st.tier].toUpperCase(), String(st.towers)))
        list.add(Text.translate('grindless.machine.wireless_energy_tower.flow', W.perTick(st.inPerSecond), W.perTick(st.outPerSecond)))
      }
    } catch (e) {
      // display only
    }
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var EHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    W.hatchKindList.forEach(function (kind) {
      var k = W.hatchKinds[kind]
      W.hatchAmps.forEach(function (amps) {
        event.create(W.hatchName(kind, amps), 'custom')
          .tiers(GTValues.LV, GTValues.MV, GTValues.HV, GTValues.EV, GTValues.IV)
          .machine(function (holder, tier, tankScaling) { return new EHPM(holder, tier, IO[k.io], amps) })
          .definition(function (tier, builder) {
            builder
              .langValue(GTValues.VNF[tier] + ' ' + (amps === 2 ? '' : amps + 'A ') + k.label)
              .rotationState(RotationState.ALL)
              .abilities(PartAbility[k.ability])
            builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
            builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](modelOf('block/machines/wireless/' + kind + '_' + amps + 'a'))
            builder['tooltips(net.minecraft.network.chat.Component[])'](hatchTooltips(kind, tier, amps))
          })
      })
    })

    Pat.register(W.towerId, TOWER_SPEC)
    event.create('wireless_energy_tower', 'multiblock')
      .langValue('Wireless Energy Tower')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('dummy')
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, TOWER_SPEC) })
      .additionalDisplay(towerDisplay)
      ['tooltips(net.minecraft.network.chat.Component[])']([
        Text.translate('grindless.machine.wireless_energy_tower.tooltip.0'),
        Text.translate('grindless.machine.wireless_energy_tower.tooltip.1'),
        Text.translate('grindless.machine.wireless_energy_tower.tooltip.2'),
        Text.translate('grindless.machine.wireless_energy_tower.tooltip.3')
      ])
      .workableCasingModel(T.tower.casingTexture, 'grindless:block/multiblock/wireless_energy_tower')
  })
})()
