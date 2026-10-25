// -----------------------------------------------------------------------------------------------
// GregTech Leisure (GTL) idea, reimplemented: our own "Large Steam X" family, a step up from the small steam
// family (steam/small_family.js, another agent's file) at the Steam -> LV transition. GTL's licence is not
// permissive (docs/research/leisure.md): no code, textures or text were copied, only the idea (bigger steam
// multiblocks, 64 parallels) and our own numbers, patterns and art. GTL's assembler member (an AE2 molecular
// assembler core) is skipped: it does not fit a KubeJS-only steam multiblock.
//
// Every one of the five is a SteamParallelMultiblockMachine (GTM's steam multiblock logic, same as GTM's own
// steam_grinder / steam_oven and our small steam machines): duration x1.5, steam from a steam hatch, and GTM
// rejects any recipe above LV voltage (32 EU/t) outright (SteamParallelMultiblockMachine#recipeModifier,
// `RecipeHelper.getRecipeEUtTier(recipe) > GTValues.LV`). Unlike GTM's own steam_grinder/steam_oven, these do NOT
// call addOutputLimit(ItemRecipeCapability.CAP, 1): that call is what keeps GTM's bundled steam machines to a
// single guaranteed output, dropping every chance byproduct. Our whole point is the ore byproduct chain, so every
// recipe type keeps its full chance-output set; only the pattern's bus/hatch count is generous (2 output buses +
// up to 2 fluid output hatches) to hold it.
//
// Each controller runs ONE of GTM's own recipe types directly, unmodified (no gtceu:recipe_type registration
// here: '.recipeType(name)' resolves a bare string through the shared GTM registry - GTRecipeTypes.get(name),
// GregTechKubeJSPlugin's TypeWrapper for GTRecipeType - exactly like our custom types in steam/recipe_types.js,
// except these names are GTM's own built-in types, never touched or widened):
//
//   gtceu:large_steam_macerator            gtceu:macerator            1 in / 4 out, no fluids         EUt 2 always
//   gtceu:large_steam_centrifuge           gtceu:centrifuge           2 in / 6 out, 1 fluid in/6 out   EUt 5-24 for dust byproducts
//   gtceu:large_steam_thermal_centrifuge   gtceu:thermal_centrifuge   1 in / 3 out, no fluids          EUt 30 (type default)
//   gtceu:large_steam_chemical_bath        gtceu:chemical_bath        1 in / 6 out, 1 fluid in/1 out   EUt 4-32 for the ore-bathing recipes
//   gtceu:large_steam_ore_washer           gtceu:ore_washer           2 in / 3 out, 1 fluid in         EUt 4-16 always
//
// Verified against GTM 7.5.3 source (data/recipe/generated/OreRecipeHandler.java, the ore byproduct chain every
// raw/crushed ore goes through): macerator recipes are always EUt 2; ore washer recipes are EUt 4 or the type's
// default 16; thermal centrifuge's crushed/purified -> refined recipes take the type's default EUt 30; centrifuge's
// dirty/pure dust recipes are EUt 24 and 5; chemical bath's crushed-ore-bathing recipe is EUt VA[LV] = 32. All five
// are therefore steam-legal for the exact recipes this family exists to run (the ore byproduct chain), so none of
// the five needed the LV-electric fallback the brief allowed for centrifuge/thermal centrifuge. Some OTHER recipes
// of these same types (naquadah separations, hot-ingot chemical baths...) sit above LV and are simply never offered
// by this machine - same as GTM's own steam_grinder never offers an MV-tier macerator recipe.
//
// Ids: gtceu:large_steam_<machine>, distinct from GTM's own GCyM "large_*" machines (verified against GTM source,
// common/data/machines/GCYMMachines.java): gtceu:large_maceration_tower (macerator alone), gtceu:large_chemical_bath
// (chemical_bath + ore_washer fused) and gtceu:large_centrifuge (centrifuge + thermal_centrifuge fused) are IV+,
// electric, PARALLEL_HATCH-driven multiblocks with their own distinct names - no id collision, and this family keeps
// the five recipe types SEPARATE (one controller each) rather than fusing them.
//
// Shape (one family look, "a step up from the small steam family": bigger, steel-and-brass, more industrial):
// a 5x5x5 steel shell (gtceu:solid_machine_casing, the LV-tier casing already used by our LV multis/observatory/
// arc furnace/heliostat tower/ore plant/biorefinery - steel is a Vapor-era resource already, see docs/eras/steam.md
// step 6; no later-era material is needed anywhere in this family) with a bronze-or-steel frame post at each of the
// 4 true vertical edges (the "steel-and-brass" industrial-girder look: brass itself needs zinc, not available until
// LV's sulfide roaster, so the brass look is a texture accent on bronze/steel, same call the observatory made for
// its "brass" clockwork - see docs/eras/steam.md's observatory decisions). The controller sits at the middle of the
// front face. 125 cells total: 20 are the 4 corner frame posts (4 x 5 Y-layers), 1 is the controller, the remaining
// 104 are a single 'X' = oneOf(casing, steam hatch, steam input bus, 2 steam output buses, and per-machine fluid
// hatches as the recipe type needs - see CASING_MIN below) cell: the player places every part anywhere among the
// 104 'X' cells, same freedom as every other family in this pack. 64 parallels (the brief's cap; GTL's own
// "paralelos absurdos" are explicitly out, docs/research/leisure.md SS5) means a guaranteed output can need
// more than one 64-stack, hence 2 output buses (8 slots) instead of 1.
//
// Textures: overlay dir grindless:block/multiblock/<machine> (overlay_front{,_active,_active_emissive}.png + the
// active .mcmeta), generated by tools/assets/Build-SteamLargeFamilyTextures.ps1 - all our own pixel art, nothing
// from GTL. Names: client_scripts/grindless/steam_large_family_lang.js. Crafting: server_scripts/grindless/steam/
// large_family.js.
(function () {
  const Pat = global.grindless.patterns

  const CASING = 'gtceu:solid_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const FRAME_MATERIALS = ['bronze', 'steel']
  const MAX_PARALLELS = 64
  const CUBE_SIZE = 5

  // ---------------------------------------------------------------- shared 5x5x5 shell shape
  // Slices back -> front, rows bottom -> top (lib/patterns.js convention). Every layer is a 5-wide ring: 'F' at the
  // true vertical edges (only the back and front slices have them: an edge needs x AND z both at an extreme), 'X'
  // everywhere else. The controller replaces the middle 'X' of the middle row of the front (last) slice.
  function repeatChar(ch, n) {
    var s = ''
    for (var i = 0; i < n; i++) s += ch
    return s
  }

  function buildShellSlices(size) {
    var full = repeatChar('X', size)
    var edge = 'F' + repeatChar('X', size - 2) + 'F'
    var mid = Math.floor(size / 2)
    var slices = []
    for (var z = 0; z < size; z++) {
      var isEdgeSlice = (z === 0 || z === size - 1)
      var rows = []
      for (var y = 0; y < size; y++) rows.push(isEdgeSlice ? edge : full)
      if (z === size - 1) {
        var chars = rows[mid].split('')
        chars[mid] = 'S'
        rows[mid] = chars.join('')
      }
      slices.push(rows)
    }
    return slices
  }

  const SHELL_SLICES = buildShellSlices(CUBE_SIZE)
  // 125 cells - 20 frame corners (4 x 5 layers) - 1 controller = 104 'X' cells per machine.
  const TOTAL_X_CELLS = CUBE_SIZE * CUBE_SIZE * CUBE_SIZE - 4 * CUBE_SIZE - 1

  // base parts every machine in the family has: 1 steam hatch, 1 steam input bus (4 slots, item inputs are at
  // most 2), 2 steam output buses (8 slots, item outputs are at most 6 and 64 parallels can need more than one
  // 64-stack of the guaranteed output).
  const BASE_PARTS = 4

  function machineSymbols(extraParts, casingMin) {
    var options = [Pat.block(CASING, { min: casingMin })]
    options.push(Pat.part('steam', { exact: 1 }))
    options.push(Pat.part('steam_input_bus', { exact: 1 }))
    options.push(Pat.part('steam_output_bus', { exact: 2 }))
    extraParts.forEach(function (p) { options.push(p) })
    return {
      S: Pat.controller(),
      X: Pat.oneOf.apply(null, options),
      F: Pat.frame(FRAME_MATERIALS)
    }
  }

  // ---------------------------------------------------------------- the five machines
  // casingMin = TOTAL_X_CELLS - BASE_PARTS - (the extra parts' own max count), i.e. every 'X' cell that is not one
  // of the exact/max-limited parts must be casing. recipeTypes and their real EUt ranges are documented above.
  // Crafting (each controller's "core" ingredient) lives in server_scripts/grindless/steam/large_family.js.
  const SPECS = [
    {
      id: 'large_steam_macerator', type: 'macerator', name: 'Large Steam Macerator',
      extraParts: [], casingMin: TOTAL_X_CELLS - BASE_PARTS
    },
    {
      id: 'large_steam_thermal_centrifuge', type: 'thermal_centrifuge', name: 'Large Steam Thermal Centrifuge',
      extraParts: [], casingMin: TOTAL_X_CELLS - BASE_PARTS
    },
    {
      id: 'large_steam_ore_washer', type: 'ore_washer', name: 'Large Steam Ore Washer',
      extraParts: [Pat.part('input_hatch', { exact: 1 })],
      casingMin: TOTAL_X_CELLS - BASE_PARTS - 1
    },
    {
      id: 'large_steam_chemical_bath', type: 'chemical_bath', name: 'Large Steam Chemical Bath',
      extraParts: [Pat.part('input_hatch', { exact: 1 }), Pat.part('output_hatch', { exact: 1 })],
      casingMin: TOTAL_X_CELLS - BASE_PARTS - 2
    },
    {
      id: 'large_steam_centrifuge', type: 'centrifuge', name: 'Large Steam Centrifuge',
      extraParts: [Pat.part('input_hatch', { exact: 1 }), Pat.part('output_hatch', { min: 1, max: 2 })],
      casingMin: TOTAL_X_CELLS - BASE_PARTS - 3 // 1 fluid in + up to 2 fluid out
    }
  ]

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SPECS.forEach(function (spec) {
      var fullId = 'gtceu:' + spec.id
      var SPEC = {
        slices: SHELL_SLICES,
        symbols: machineSymbols(spec.extraParts, spec.casingMin)
      }
      Pat.register(fullId, SPEC)

      event.create(spec.id, 'multiblock')
        .langValue(spec.name)
        .rotationState(RotationState.NON_Y_AXIS)
        .machine(function (holder) { return MachineConstructors.createSteamMultiblock(holder, MAX_PARALLELS) })
        .recipeType(spec.type)
        .recipeModifier(MachineModifiers.STEAM_PARALLEL_MULTIBLOCK, true)
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, SPEC) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + spec.id + '.tooltip.0'),
          Text.translate('grindless.machine.' + spec.id + '.tooltip.1'),
          Text.translate('grindless.machine.' + spec.id + '.tooltip.2'),
          Text.translate('grindless.machine.' + spec.id + '.tooltip.3')
        ])
        .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + spec.id)
    })
  })
})()
