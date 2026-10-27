// priority: 900
// -----------------------------------------------------------------------------------------------
// Grindless heating-coil helper: what lib/patterns.js lacks for coil multiblocks (patterns.js itself stays untouched).
//
//   global.grindless.coils.predicate()      a pattern-helper predicate for "any heating coil, all of one type": it builds
//                                           GTM's own Predicates.heatingCoils(), so the multiblock stores the coil type in
//                                           its match context exactly as GTM's EBF and multi smelter do
//                                           (CoilWorkableElectricMultiblockMachine reads it when the structure forms).
//                                           Its plain-data description is { kind: 'blocks', blocks: COIL_IDS }, so every tool
//                                           that reads global.grindless.structures (test placement, the reachability
//                                           validator) treats a coil cell as "one of these blocks" with no change; the extra
//                                           GTM rule (all coils of the structure of the same type) holds whenever a tool places
//                                           one id everywhere.
//   global.grindless.coils.create(holder)   a CoilWorkableElectricMultiblockMachine, for `.machine(...)`
//   global.grindless.coils.temperature(m)   coil temperature in K of a formed coil machine (0 if unknown)
//   global.grindless.coils.ids              the coil blocks of the description (GTM 7.5.3's eight plus the addon coil found in
//                                           the dump); Predicates.heatingCoils() itself accepts every registered coil
//
// Same rules as patterns.js: everything inside a function, `var` inside functions that run more than once (Rhino), GTM classes
// loaded lazily so nothing GTM-related runs at script load.
(function () {
  const G = global.grindless || (global.grindless = {})

  const COIL_IDS = [
    'gtceu:cupronickel_coil_block',
    'gtceu:kanthal_coil_block',
    'gtceu:nichrome_coil_block',
    'gtceu:rtm_alloy_coil_block',
    'gtceu:hssg_coil_block',
    'gtceu:naquadah_coil_block',
    'gtceu:trinium_coil_block',
    'gtceu:tritanium_coil_block',
    'gtceu:molybdenum_disilicide_coil_block'
  ]

  var CoilMachine = null

  function machineClass() {
    if (CoilMachine === null) {
      CoilMachine = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CoilWorkableElectricMultiblockMachine')
    }
    return CoilMachine
  }

  function predicate() {
    return {
      kind: 'blocks',
      blocks: COIL_IDS.slice(),
      build: function () { return Predicates.heatingCoils() }
    }
  }

  function create(holder) {
    var C = machineClass()
    return new C(holder)
  }

  function temperature(machine) {
    try {
      if (machine == null || !machine.isFormed()) return 0
      var coil = machine.getCoilType()
      return coil == null ? 0 : Number(coil.getCoilTemperature())
    } catch (e) {
      return 0
    }
  }

  G.coils = {
    ids: COIL_IDS,
    predicate: predicate,
    create: create,
    temperature: temperature
  }
})()
