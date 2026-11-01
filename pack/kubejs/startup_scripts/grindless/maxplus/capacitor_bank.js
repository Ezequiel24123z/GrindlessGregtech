// priority: -5549
// -----------------------------------------------------------------------------------------------
// MAX+ machine 15, the horizon capacitor bank (docs/eras/maxplus.md "Machines" 15; package XP-H5): the network store that holds the
// Hyperstargate's dial charge, and its cell, grindless:horizon_capacitor (2^48 EU at tier 14).
//
//   grindless:horizon_capacitor    a cell block (a pickaxe block that drops itself). It is not a tiers[] cell of tables/wireless_energy.json:
//                                  no wireless energy tower takes it and no tower cell fits the bank
//   gtceu:horizon_capacitor_bank   a store, not a machine with hatches: a 25 x 5 x 25 ring of 40 slots, each a capacitor or the bank's casing
//                                  (an empty slot). Built like the wireless energy tower (recipe type dummy); the network reads it in
//                                  server_scripts/grindless/lv/wireless_energy.js and counts it only at Sgr A* orbit
//
// Everything comes from the table's maxplusCells and maxplusBank (global.grindless.wireless.table). The callbacks run after every startup
// script has loaded, so the wireless global exists by then whatever the load order.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const LOG = '[grindless/maxplus] '

  function wireless() {
    var W = G.wireless
    if (!W || !W.table || !W.table.maxplusBank || !W.table.maxplusCells) throw new Error(LOG + 'capacitor_bank.js: the wireless table has no maxplusCells / maxplusBank')
    return W
  }

  // slices back -> front, rows bottom -> top. A square ring 25 x 25 on its outline, five rows high: a robust-casing floor, a casing row, the
  // slot row, a casing row with a glass band and the roof, with atomic-casing pillars at the corners. The slot row has a slot at every second
  // cell from the 3rd to the 21st of each side (10 a side, 40 in all) and a superconducting coil in every other cell: the storage ring's
  // winding; the controller sits in the middle of the front side, in the second row (uiv/shapes.js convention).
  const SIZE = 25
  const MID = 12
  function ringChar(x, y, z) {
    var edge = x === 0 || x === SIZE - 1 || z === 0 || z === SIZE - 1
    if (!edge) return ' '
    if (y === 1 && z === SIZE - 1 && x === MID) return 'S'
    var corner = (x === 0 || x === SIZE - 1) && (z === 0 || z === SIZE - 1)
    if (corner) return 'A'
    var along = x === 0 || x === SIZE - 1 ? z : x
    if (y === 0) return 'B'
    if (y === 2) return along >= 2 && along <= 20 && along % 2 === 0 ? 'C' : 'K'
    if (y === 3) return along % 4 === 1 ? 'L' : 'F'
    return 'F'
  }

  function bankSpec(W) {
    var b = W.table.maxplusBank
    var cell = W.table.maxplusCells[0].cell
    var slices = []
    for (var z = 0; z < SIZE; z++) {
      var rows = []
      for (var y = 0; y < 5; y++) {
        var row = ''
        for (var x = 0; x < SIZE; x++) row += ringChar(x, y, z)
        rows.push(row)
      }
      slices.push(rows)
    }
    var casing = Pat.block(b.casing)
    return {
      slices: slices,
      symbols: {
        S: Pat.controller(), F: casing, C: Pat.oneOf(Pat.block(cell), casing),
        B: Pat.block('gtceu:robust_machine_casing'), A: Pat.block('gtceu:atomic_casing'), K: Pat.block('gtceu:superconducting_coil'),
        L: Pat.block('gtceu:cleanroom_glass')
      }
    }
  }

  // the controller's lines: the bank's capacitors and why it does or does not count, then the network (server side only)
  function bankDisplay(controller, list) {
    try {
      if (!controller.isFormed()) return
      var level = controller.getLevel()
      if (level === null || level === undefined || level.isClientSide()) return
      var W = G.wireless
      if (typeof W.bankInfo !== 'function' || typeof W.status !== 'function') return
      var info = W.bankInfo(controller)
      if (info.pending) return
      if (!info.atSite) {
        list.add(Text.translate('grindless.machine.horizon_capacitor_bank.wrong_site').red())
      } else if (info.capacitors === 0) {
        list.add(Text.translate('grindless.machine.horizon_capacitor_bank.no_capacitors').red())
      } else {
        list.add(Text.translate('grindless.machine.horizon_capacitor_bank.capacitors', String(info.capacitors), W.fmt(info.capacity)))
      }
      var st = W.status(level.getServer())
      list.add(Text.translate('grindless.machine.horizon_capacitor_bank.network', String(st.banks), W.fmt(st.bankCapacity), W.fmt(st.stored)))
    } catch (e) {
      // display only
    }
  }

  StartupEvents.registry('block', function (event) {
    var W = wireless()
    var FU = Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil')
    W.table.maxplusCells.forEach(function (r) {
      event.create(r.cell)
        .soundType(SoundType.METAL)
        .hardness(4)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll(r.texture)
        .item(function (item) {
          item.tooltip(Text.gray(Text.translate('tooltip.grindless.horizon_capacitor.0', String(FU.formatNumbers(r.capacity)))))
          item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.horizon_capacitor.1')))
        })
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var W = wireless()
    var b = W.table.maxplusBank
    var spec = bankSpec(W)
    G.maxPlusCapacitorBank = { spec: spec }
    Pat.register(b.id, spec)
    event.create('horizon_capacitor_bank', 'multiblock')
      .langValue('Horizon Capacitor Bank')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('dummy')
      .appearanceBlock(function () { return Block.getBlock(b.casing) })
      .pattern(function (def) { return Pat.build(def, spec) })
      .additionalDisplay(bankDisplay)
      ['tooltips(net.minecraft.network.chat.Component[])']([
        Text.translate('grindless.machine.horizon_capacitor_bank.tooltip.0'),
        Text.translate('grindless.machine.horizon_capacitor_bank.tooltip.1')
      ])
      .workableCasingModel(b.casingTexture, 'grindless:block/multiblock/horizon_capacitor_bank')
  })
})()
