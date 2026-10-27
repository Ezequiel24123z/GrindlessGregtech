// priority: -14724
// -----------------------------------------------------------------------------------------------
// GTM Extended Features (extendedfeatures 3.0.0), audited against docs/eras (ev.md, "Decisions taken": no addon may process
// cheaper than GT in its era or undercut the pack's own multiblocks). Its recipes are generated in Java (the jar's data folder has
// none) and it ships a crafting recipe for ONE controller only, the Large Gas Collector (IV); the other multiblocks and the
// hatches have none.
//
// Removed: every recipe of the addon's own type, any recipe that makes the controller, and the controller is hidden in EMI
// (tag c:hidden_from_recipe_viewers).
//   Industrial Greenhouse, Advanced Conservatory   greenhouse_crop_recipes (26) and greenhouse_wood_recipes (16): 16-64 crops or
//                         64-128 logs per run at 120 EU/t, the job of our greenhouse family (recipe type gtceu:greenhouse).
//   Rock Processing Plant rock_processing_plant (7, 1 920 EU/t): one block + lubricant -> dusts. End stone gives 50 % tungstate
//                         and 25 % platinum (GTM's end stone dust centrifuge: 4.45 % and 0.8 %), netherrack 20 % gold (GTM
//                         0.75 %), deepslate aluminium (GTM: none), obsidian 1 iron per block (GTM: 1 per 8): metals out of plain
//                         rock, past the vein drills.
//   Synthesis Vessel      chemical_skips (2). platinum_processing_line (7 680 EU/t): 12 PGS + 1 500 mB aqua regia -> 4 Pt, 3 Pd,
//                         2 Ru, 3 Rh, 2 Os, 2 Ir and more acid than it takes, 2-4.5x GTM's yields, past our EV platinum plant.
//                         naquadah_processing_line (30 720 EU/t): the tier of GTM's own naquadah separation (LuV), with trinium
//                         and naquadria straight out. A skip is fair only two tiers above the line it skips and never past one of
//                         our plants; both fail, so the vessel has nothing left to do.
//   Universal Disassembly Machine   component_disassembly (4: fusion casings and coil, LuV-UV) and machine_disassembly (built in
//                         Java: any GT machine -> all of its crafting ingredients back, intact), recycling better than GTM's.
//   Robust Alloy Materializer   GTM's alloy_blast_smelter recipes with perfect overclocks: cheaper than GTM's Alloy Blast Smelter
//                         in every era. GTM's type and recipes stay; only the controller is kept out.
// IV at the earliest (GCYM-style parallel machines, ev.md decision 5), uncraftable today so nothing to raise: Large Cracking
// Machine (gtceu:cracker), Large Pyrolysis Oven (gtceu:pyrolyse_oven), Expanded Assembly Line (gtceu:assembly_line, needs the
// addon's LuV wireless optical receptor). If the IV wave wants them, their controller follows GTM's GCYM recipes: IV circuits +
// the IV machine they enlarge + tungsten steel parts.
// Kept: Large Gas Collector (IV recipe: IV circuits, motor, pump and gas collector; air, nether air and ender air, each in its
// dimension), the universal circuits (assembler, 1 circuit of a tier -> 1 universal circuit in the same #gtceu:circuits/<tier>
// tag: not a shortcut) and the parts without a recipe (Matrix Data Relay, Power Transformer, LuV-UHV data access and wireless
// optical hatches, configurable cleaning maintenance hatch). GTM's own cleaning hatch moved from UV to an HV recipe of ours on
// 2026-10-25 (mv/leisure_utility.js, a GregTech Leisure idea), so the addon's configurable one stays without a recipe.
// Cleaner, but not a server script: MultiblocksConfig in config/extendedfeatures.yaml unregisters the removed machines.
// Era: never for the removed machines; IV or later for the large ones.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/extendedfeatures] '
  var REMOVED_TYPES = ['greenhouse_crop_recipes', 'greenhouse_wood_recipes', 'rock_processing_plant', 'chemical_skips',
    'component_disassembly', 'machine_disassembly']
  var REMOVED_CONTROLLERS = ['industrial_greenhouse', 'advanced_conservatory', 'rock_processing_plant', 'synthesis_vessel',
    'universal_disassembly_machine', 'robust_alloy_materializer']

  // the removed controllers that are registered (a config switch can unregister them)
  function controllers() {
    return REMOVED_CONTROLLERS.map(function (name) { return 'extendedfeatures:' + name })
      .filter(function (id) { return Item.exists(id) })
  }

  ServerEvents.recipes(function (event) {
    var removed = 0
    REMOVED_TYPES.forEach(function (name) {
      var type = 'extendedfeatures:' + name
      event.forEachRecipe({ type: type }, function () { removed++ })
      event.remove({ type: type })
    })
    var ids = controllers()
    ids.forEach(function (id) { event.remove({ output: id }) })
    console.info(LOG + 'removed ' + removed + ' recipes of ' + REMOVED_TYPES.length + ' recipe types; controllers kept out: ' + ids.join(', '))
  })

  ServerEvents.tags('item', function (event) {
    controllers().forEach(function (id) { event.add('c:hidden_from_recipe_viewers', id) })
  })
})()
